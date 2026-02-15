#!/bin/bash

# Script to set up Android SDK environment variables
# This script will add ANDROID_HOME and ANDROID_SDK_ROOT to your shell profile

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔧 Android SDK Environment Setup"
echo ""

# Detect Android SDK location
ANDROID_SDK_PATH=""

# Check common locations
if [ -d "$HOME/Library/Android/sdk" ]; then
  ANDROID_SDK_PATH="$HOME/Library/Android/sdk"
  echo -e "${GREEN}✅ Found Android SDK at: $ANDROID_SDK_PATH${NC}"
elif [ -d "$HOME/Android/Sdk" ]; then
  ANDROID_SDK_PATH="$HOME/Android/Sdk"
  echo -e "${GREEN}✅ Found Android SDK at: $ANDROID_SDK_PATH${NC}"
else
  echo -e "${RED}❌ Android SDK not found in common locations${NC}"
  echo "Please enter the path to your Android SDK:"
  read -r ANDROID_SDK_PATH
  
  if [ ! -d "$ANDROID_SDK_PATH" ]; then
    echo -e "${RED}❌ Error: Directory does not exist: $ANDROID_SDK_PATH${NC}"
    exit 1
  fi
fi

# Verify platform-tools exists
if [ ! -d "$ANDROID_SDK_PATH/platform-tools" ]; then
  echo -e "${YELLOW}⚠️  Warning: platform-tools directory not found${NC}"
  echo "   Make sure Android SDK platform-tools are installed"
fi

# Determine shell profile based on actual shell, not script interpreter
SHELL_PROFILE=""
CURRENT_SHELL="${SHELL:-$(getent passwd "$USER" | cut -d: -f7)}"

if [[ "$CURRENT_SHELL" == *"zsh"* ]] || [ -n "$ZSH_VERSION" ]; then
  SHELL_PROFILE="$HOME/.zshrc"
elif [[ "$CURRENT_SHELL" == *"bash"* ]] || [ -n "$BASH_VERSION" ]; then
  if [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
  else
    SHELL_PROFILE="$HOME/.bashrc"
  fi
else
  # Default to .zshrc on macOS
  if [ "$(uname)" == "Darwin" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
  else
    SHELL_PROFILE="$HOME/.bashrc"
  fi
fi

echo ""
echo "📝 Will update: $SHELL_PROFILE"
echo ""

# Check if already configured
if grep -q "ANDROID_HOME\|ANDROID_SDK_ROOT" "$SHELL_PROFILE" 2>/dev/null; then
  # Extract existing ANDROID_HOME value
  EXISTING_ANDROID_HOME=$(grep -E "^export ANDROID_HOME=" "$SHELL_PROFILE" 2>/dev/null | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s|^$HOME|~|" || echo "")
  EXISTING_ANDROID_SDK_ROOT=$(grep -E "^export ANDROID_SDK_ROOT=" "$SHELL_PROFILE" 2>/dev/null | head -1 | sed 's/.*="\(.*\)"/\1/' | sed "s|^$HOME|~|" || echo "")
  
  # Check if existing config matches what we want to set
  if [ -n "$EXISTING_ANDROID_HOME" ] && [ "$EXISTING_ANDROID_HOME" == "$ANDROID_SDK_PATH" ]; then
    echo -e "${GREEN}✅ Android SDK is already correctly configured in $SHELL_PROFILE${NC}"
    echo "   ANDROID_HOME=$EXISTING_ANDROID_HOME"
    if [ -n "$EXISTING_ANDROID_SDK_ROOT" ]; then
      echo "   ANDROID_SDK_ROOT=$EXISTING_ANDROID_SDK_ROOT"
    fi
    echo ""
    echo -e "${GREEN}✅ Configuration is up to date. No changes needed.${NC}"
    echo ""
    echo "To verify, run:"
    echo "   source $SHELL_PROFILE"
    echo "   echo \$ANDROID_HOME"
    echo "   adb version"
    exit 0
  else
    echo -e "${YELLOW}⚠️  Android SDK environment variables already exist in $SHELL_PROFILE${NC}"
    if [ -n "$EXISTING_ANDROID_HOME" ]; then
      echo "   Current: ANDROID_HOME=$EXISTING_ANDROID_HOME"
    fi
    echo "   Target:  ANDROID_HOME=$ANDROID_SDK_PATH"
    echo ""
    echo "   Would you like to update them? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      echo "Skipping update."
      exit 0
    fi
    
    # Remove old Android SDK configuration
    sed -i.bak '/# Android SDK Configuration/,/# End Android SDK Configuration/d' "$SHELL_PROFILE" 2>/dev/null || \
    sed -i.bak '/ANDROID_HOME/d; /ANDROID_SDK_ROOT/d' "$SHELL_PROFILE" 2>/dev/null || true
  fi
fi

# Create backup
cp "$SHELL_PROFILE" "${SHELL_PROFILE}.bak.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true

# Add Android SDK configuration
echo "" >> "$SHELL_PROFILE"
echo "# Android SDK Configuration" >> "$SHELL_PROFILE"
echo "# Added by appium-bdd setup script on $(date)" >> "$SHELL_PROFILE"
echo "export ANDROID_HOME=\"$ANDROID_SDK_PATH\"" >> "$SHELL_PROFILE"
echo "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_PATH\"" >> "$SHELL_PROFILE"
echo "export PATH=\"\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin\"" >> "$SHELL_PROFILE"
echo "# End Android SDK Configuration" >> "$SHELL_PROFILE"

echo -e "${GREEN}✅ Successfully added Android SDK configuration to $SHELL_PROFILE${NC}"
echo ""
echo "📋 Configuration added:"
echo "   export ANDROID_HOME=\"$ANDROID_SDK_PATH\""
echo "   export ANDROID_SDK_ROOT=\"$ANDROID_SDK_PATH\""
echo "   export PATH=\"\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin\""
echo ""
echo -e "${YELLOW}⚠️  To apply changes, run one of the following:${NC}"
echo "   source $SHELL_PROFILE"
echo "   or"
echo "   open a new terminal window"
echo ""
echo "Then verify with:"
echo "   echo \$ANDROID_HOME"
echo "   adb version"
