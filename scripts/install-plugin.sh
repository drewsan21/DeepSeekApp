#!/bin/bash

# Individual Plugin Installation Scripts
# Usage: ./scripts/install-plugin.sh <plugin-name>

set -e

PLUGIN_NAME=$1

if [ -z "$PLUGIN_NAME" ]; then
    echo "Usage: ./install-plugin.sh <plugin-name>"
    echo ""
    echo "Available plugins:"
    echo "  - open-design"
    echo "  - archify"
    echo "  - ruflo"
    echo "  - openviking"
    echo "  - deepseek-reasonix"
    echo "  - dsh-desktop"
    echo "  - nocobase"
    echo "  - dsh-free-model"
    exit 1
fi

case $PLUGIN_NAME in
    open-design)
        echo "Installing OpenDesign..."
        npm install -g @open-design/cli
        echo "OpenDesign installed successfully!"
        ;;
    archify)
        echo "Installing Archify..."
        npm install -g archify
        echo "Archify installed successfully!"
        ;;
    ruflo)
        echo "Installing Ruflo..."
        npm install -g ruflo
        echo "Ruflo installed successfully!"
        ;;
    openviking)
        echo "Installing OpenViking..."
        npm install -g @volcengine/openviking
        echo "OpenViking installed successfully!"
        ;;
    deepseek-reasonix)
        echo "Installing DeepSeek-Reasonix..."
        npm install -g deepseek-reasonix
        echo "DeepSeek-Reasonix installed successfully!"
        ;;
    dsh-desktop)
        echo "Installing DSH Desktop..."
        npm install -g @anywhere-labs/dsh-desktop
        echo "DSH Desktop installed successfully!"
        ;;
    nocobase)
        echo "Installing NocoBase..."
        npm install -g nocobase
        echo "NocoBase installed successfully!"
        ;;
    dsh-free-model)
        echo "Installing DSH Free Model..."
        npm install -g dsh-free-model
        echo "DSH Free Model installed successfully!"
        ;;
    *)
        echo "Unknown plugin: $PLUGIN_NAME"
        echo "Run ./install-plugin.sh without arguments to see available plugins"
        exit 1
        ;;
esac
