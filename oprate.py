#!venv python
# -*- coding: utf-8 -*-
# @name   : operate.py
# @author : peterfei
import os
import time
def bash_shell(bash_command): 
    return os.system(bash_command)

if __name__ == '__main__':
  print('========正在注备环境==========')
  print("***拉取相关代码***")
  bash_shell('git pull origin dev')
  print("***执行yarn安装相关package***")
  bash_shell('yarn')
  print("***拷贝补丁文件***")
  path =  os.path.join(os.getcwd(),'scripts/link.js')

  bash_shell("cp %s %s/node_modules/react-native/local-cli/link/link.js" % (path,os.getcwd()) )
  print("***拷贝Android Setting***")
  
  bash_shell('react-native link')
  print("***Unity相关资源拷贝***")
  
  print("******打包******")
  bash_shell("react-native run-android")
  
  print("=============启动日志====================")
  # time.sleep(1)
  bash_shell("%s/logcat_package.sh  com.orthexpert"%(os.getcwd()))