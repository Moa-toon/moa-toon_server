sudo cp /home/ubuntu/envs/.env.moatoon /home/ubuntu/moatoon_server/.env
cd /home/ubuntu/moatoon_server
docker build . -t moatoon_server:latest