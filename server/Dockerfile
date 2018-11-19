ARG version=3.6.7
FROM python:$version-slim-stretch

ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential

COPY requirements.txt .
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

RUN adduser --disabled-password --gecos "" -u 1000 python
USER python

COPY . /app

EXPOSE 5050

CMD ["gunicorn", "--config", "gunicorn.conf", "wqp:app"]
