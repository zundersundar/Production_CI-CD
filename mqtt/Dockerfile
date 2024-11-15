FROM python:3.8-slim

WORKDIR /app
COPY . /app


RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3333


CMD ["python","mqtt_sub.py","--host=0.0.0.0","--port=3333"]
