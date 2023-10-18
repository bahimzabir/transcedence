FROM nginx
RUN echo "sleep 15 && nginx -g 'daemon off;'" > init.sh
RUN chmod +x init.sh
CMD ["bash", "init.sh"]