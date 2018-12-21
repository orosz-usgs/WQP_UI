#!/usr/bin/env bash
set -e

# Read environment variables from file and export them.
file_env() {
    while read -r line || [[ -n ${line} ]]; do
        export ${line}
    done < "$1"
}

if  ! [ -z ${MOUNT_DIRECTORY} ]; then
    # if mount exists then export environment variables
    for FILE in ${MOUNT_DIRECTORY}/*.env; do
        file_env ${FILE}
    done
fi

exec "$@"
