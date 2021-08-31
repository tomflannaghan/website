---
title: Setting up watchdog on Raspberry Pi with Ansible
layout: post
---

The Raspberry Pi has a hardware watchdog timer on its board that is able to restart the board. This is a super useful feature if you want your Pi to restart in the case of a system failure like a kernel panic or a process consuming all resources. [This page](https://iotassistant.io/raspberry-pi/how-to-set-watchdog-timer-raspberrypi/)  explains how to set this up manually on a Pi.

Here's the equivalent ansible playbook:
```yaml
---
- hosts: all
  become: yes
  tasks:

    - name: 'Enable watchdog in boot/config.txt'
      import_role:
        name: infothrill.rpi_boot_config
      vars:
        boot_config_lines:
          - "dtparam=watchdog=on"

    - name: 'Configure the watchdog'
      import_role:
        name: danmilon.watchdog
      vars:
        watchdog_device: /dev/watchdog
        watchdog_timeout: 15
        watchdog_realtime: yes
        watchdog_priority: 1
        watchdog_max_load_1: 24
```

To install dependancies:
```sh
ansible-galaxy install infothrill.rpi_boot_config
ansible-galaxy install danmilon.watchdog
```

The system should then restart automatically if you crash the system, e.g. by triggering a kernel panic:

```sh
# WARNING THIS WILL CRASH YOUR SYSTEM
echo c > /proc/sysrq-trigger
```


Some notes:

- I'm using `danmilon.watchdog` which is not the usual watchdog role (that is `whiskerlabs.watchdog`). However, whiskerlabs don't expose the `watchdog-timeout` setting that we must set on the Raspberry Pi.
- I've only tested this works on Raspberry Pi Zero W running Raspbian Buster.