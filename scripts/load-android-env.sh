#!/bin/bash

# Load Android SDK environment variables from shell profile
# This ensures the variables are available even if the shell profile hasn't been sourced

# Determine which profile to source
if [ -f "$HOME/.zshrc" ]; then
  PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
  PROFILE="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
  PROFILE="$HOME/.bashrc"
else
  PROFILE=""
fi

# Extract Android SDK variables from profile
if [ -n "$PROFILE" ] && [ -f "$PROFILE" ]; then
  # Extract ANDROID_HOME from profile
  ANDROID_HOME_VAL=$(grep -E "^export ANDROID_HOME=" "$PROFILE" 2>/dev/null | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s|^\$HOME|$HOME|" | sed "s|^~|$HOME|" || echo "")
  
  # Extract ANDROID_SDK_ROOT from profile
  ANDROID_SDK_ROOT_VAL=$(grep -E "^export ANDROID_SDK_ROOT=" "$PROFILE" 2>/dev/null | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s|^\$HOME|$HOME|" | sed "s|^~|$HOME|" || echo "")
  
  # Use ANDROID_HOME if found
  if [ -n "$ANDROID_HOME_VAL" ] && [ -d "$ANDROID_HOME_VAL" ]; then
    export ANDROID_HOME="$ANDROID_HOME_VAL"
    if [ -n "$ANDROID_SDK_ROOT_VAL" ] && [ -d "$ANDROID_SDK_ROOT_VAL" ]; then
      export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT_VAL"
    else
      export ANDROID_SDK_ROOT="$ANDROID_HOME_VAL"
    fi
    export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin"
  fi
fi

# If still not set, try to detect from common locations
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
    export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin"
  elif [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
    export ANDROID_SDK_ROOT="$HOME/Android/Sdk"
    export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin"
  fi
fi

# Execute the command passed as arguments
exec "$@"
