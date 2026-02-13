#!/bin/bash

user_name=zafuzi
game_title=brazen

if [[ " $@ " =~ "-z " ]]; then
  echo "creating dist.zip"
	rm dist.zip
	zip -r dist.zip dist;
fi

if [[ " $@ " =~ "-p " ]]; then
	butler push dist $user_name/$game_title:html5;
fi

if [[ " $@ " =~ "-s " ]]; then
	butler status $user_name/$game_title:html5
fi