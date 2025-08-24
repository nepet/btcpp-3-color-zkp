#!/bin/bash

# Check if exactly 3 parameters are provided
if [ $# -ne 3 ]; then
    echo "Usage: $0 vertex_id color_id nonce"
    echo "Example: $0 0 1 abc123def456"
    exit 1
fi

vertex_id=$1
color_id=$2
nonce=$3

# Create the input string in the same format as the JavaScript code
input_string="${vertex_id}-${color_id}-${nonce}"

# Calculate SHA-256 hash and truncate to first 16 characters (same as JavaScript)
hash=$(echo -n "$input_string" | sha256sum | cut -c1-16)

echo "$hash"