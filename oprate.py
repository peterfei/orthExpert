#!venv python
# -*- coding: utf-8 -*-
# @name   : operate.py
# @author : peterfei
import os

def bash_shell(bash_command): 
    return os.system(bash_command)

if __name__ == '__main__':
  print('****正在注备环境****')
  print("***执行yarn安装相关package***")
  bash_shell('yarn')
  print("***拷贝补丁文件***")
  bash_shell('cp ./link.js ./node_modules/react-native/local-cli/link/link.js')
  print("***拷贝Android Setting***")
  # path = os.popen('pwd').read()
  # print("当前路径:",path)
  # settingPath = path+"/android/settings.gradle"
  # print("settingPath:",settingPath)
  # command= "rm  %s" % {settingPath}
  # os.system(command) 
  # bash_shell('cp ./android/settings.gradle.bak ./android/settings.gradle')
  # bash_shell('cp ./android/app/src/main/java/com/orghexpert/MainApplication.java.bak ./android/app/src/main/java/com/orghexpert/MainApplication.java')
  bash_shell('react-native link')
  print("***Unity相关资源拷贝***")
  print("***拉取相关代码***")
  bash_shell('git pull origin dev')
  print("******打包******")
  bash_shell("react-native run-android")
