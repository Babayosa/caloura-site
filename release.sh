#!/bin/bash
# Usage: ./release.sh /path/to/Caloura-X.Y.Z.zip
# Copies the zip, updates appcast.xml and index.html, commits and pushes

set -e

if [ -z "$1" ]; then
    echo "Usage: ./release.sh /path/to/Caloura-X.Y.Z.zip"
    exit 1
fi

ZIP_PATH="$1"
ZIP_NAME=$(basename "$ZIP_PATH")

# Extract version from filename (e.g., Caloura-1.0.1.zip -> 1.0.1, Caloura-1.1.zip -> 1.1)
VERSION=$(echo "$ZIP_NAME" | sed -E 's/Caloura-([0-9]+(\.[0-9]+)+)\.zip/\1/')

if [ -z "$VERSION" ] || [ "$VERSION" = "$ZIP_NAME" ]; then
    echo "Error: Could not extract version from filename. Expected format: Caloura-X.Y.Z.zip or Caloura-X.Y.zip"
    exit 1
fi

echo "Releasing Caloura v$VERSION..."

# Check zip exists
if [ ! -f "$ZIP_PATH" ]; then
    echo "Error: File not found: $ZIP_PATH"
    exit 1
fi

# Get script directory (site root)
SITE_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SITE_DIR"

# Copy zip to releases
echo "Copying zip to releases/"
cp "$ZIP_PATH" "releases/$ZIP_NAME"

# Get file size
LENGTH=$(stat -f%z "releases/$ZIP_NAME")

# Generate EdDSA signature (requires Sparkle's sign_update in PATH or ~/Applications)
echo "Generating EdDSA signature..."
if command -v sign_update &> /dev/null; then
    SIGN_OUTPUT=$(sign_update "releases/$ZIP_NAME")
elif [ -f "$HOME/Applications/Sparkle/bin/sign_update" ]; then
    SIGN_OUTPUT=$("$HOME/Applications/Sparkle/bin/sign_update" "releases/$ZIP_NAME")
else
    echo "Error: sign_update not found. Install Sparkle or add to PATH."
    exit 1
fi

# Extract signature from output (format: sparkle:edSignature="..." length="...")
SIGNATURE=$(echo "$SIGN_OUTPUT" | grep -oE 'sparkle:edSignature="[^"]+"' | cut -d'"' -f2)

if [ -z "$SIGNATURE" ]; then
    echo "Error: Could not extract signature"
    exit 1
fi

echo "Signature: $SIGNATURE"
echo "Length: $LENGTH"

# Calculate build number (increment from current highest)
CURRENT_BUILD=$(grep -oE 'sparkle:version>[0-9]+' appcast.xml | head -1 | grep -oE '[0-9]+')
NEW_BUILD=$((CURRENT_BUILD + 1))

# Get current date in RFC 2822 format
PUBDATE=$(date -R)

echo "Build number: $NEW_BUILD"
echo "Updating appcast.xml..."

# Write new item to temp file, then insert after <language>en</language>
TMPITEM=$(mktemp)
cat > "$TMPITEM" <<XMLEOF
    <item>
      <title>Version $VERSION</title>
      <pubDate>$PUBDATE</pubDate>
      <sparkle:version>$NEW_BUILD</sparkle:version>
      <sparkle:shortVersionString>$VERSION</sparkle:shortVersionString>
      <sparkle:minimumSystemVersion>14.0</sparkle:minimumSystemVersion>
      <description><![CDATA[
        <h2>What's New</h2>
        <ul>
          <li>See release notes</li>
        </ul>
      ]]></description>
      <enclosure
        url="https://caloura.app/releases/$ZIP_NAME"
        type="application/octet-stream"
        sparkle:edSignature="$SIGNATURE"
        length="$LENGTH"
      />
    </item>
XMLEOF

# Use sed 'r' to read from file (avoids escaping issues with multi-line content)
sed -i '' "/<language>en<\/language>/r $TMPITEM" appcast.xml
rm -f "$TMPITEM"

echo "Updating index.html download link..."
# Update download link to new version
sed -i '' "s|releases/Caloura-[0-9][0-9.]*\.zip|releases/$ZIP_NAME|g" index.html

echo "Committing and pushing..."
git add releases/"$ZIP_NAME" appcast.xml index.html
git commit -m "Release v$VERSION"
git push

echo ""
echo "Done! v$VERSION is now live at https://caloura.app"
echo "GitHub Pages may take 1-2 minutes to propagate."
