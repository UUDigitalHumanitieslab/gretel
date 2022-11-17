FROM python:buster
RUN apt update

EXPOSE 8000/tcp

COPY backend/requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt

WORKDIR /gretel