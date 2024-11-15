FROM python:3.8-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 9000

CMD ["python","TW_influxdb_client.py","--host=0.0.0.0","port=9000"]
