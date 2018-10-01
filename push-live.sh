#!/bin/bash
set -e

if [ ${LIVE_TO_SERVE} ]
then
	echo "Using production settings."
	live_root_folder=${WWW_ROOT}/dayone-easyfacts-ro
else
	echo "Using developer settings."
	live_root_folder="./live_out"
fi

echo "Copy source files to ${live_root_folder}."
rsync -ac --delete ./* ${live_root_folder}

echo "Apply configurations."
restore_cwd=$(pwd)

envsubst < site-nginx.conf > "${WWW_ROOT}/../sites-enabled/dayone-easyfacts-ro.conf"

cd "${restore_cwd}"

echo "should restart nginx: systemctl restart nginx"

