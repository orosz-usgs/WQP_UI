# Build the static assets in the node.js container.
FROM wqp_assets as assets

RUN npm run build


# Base off the community Python image
FROM python:3.6.7-slim-stretch

RUN apt-get update && apt-get install -y \
    build-essential

ENV PYTHONUNBUFFERED 1

WORKDIR /server

RUN apt-get update && apt-get install -y \
    build-essential

COPY requirements.txt .
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Add source files and pre-compile them
COPY . /server
RUN python -m compileall -f
RUN python -m compileall -f .

# Copy static files from the assets image to this one.
COPY --from=assets /assets/dist /assets

RUN adduser --disabled-password --gecos "" -u 1000 python
USER python

EXPOSE 5050

CMD ["gunicorn", "--config", "gunicorn.conf", "wqp:app"]
