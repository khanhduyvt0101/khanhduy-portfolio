#!/bin/bash

npm up --save
npx rimraf node_modules package-lock.json
npm i
