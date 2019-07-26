#!/bin/bash
PackageName=$1

#PackageName=com.example.appinfomanagertinno
pid="$(adb shell ps | grep $PackageName | awk '{print $2}')"

echo "PackageName-----"
echo "$PackageName"

echo "-----------------------------------------"
echo "-----------------------------------------"

echo "pid-----"
echo "$pid"

echo "-----------------------------------------"
echo "-----------------------------------------"

adb logcat | grep $pid
