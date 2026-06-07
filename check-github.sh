#!/bin/bash

echo "Verificando se o GitHub CLI (gh) está instalado..."

if command -v gh &> /dev/null; then
    echo "GitHub CLI instalado: $(gh --version | head -1)"
else
    echo "GitHub CLI (gh) NÃO está instalado."
    echo ""
    echo "Para instalar no Ubuntu/Debian:"
    echo "  sudo apt install gh"
    echo ""
    echo "Ou via script oficial:"
    echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    echo "  echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
    echo "  sudo apt update && sudo apt install gh"
fi
