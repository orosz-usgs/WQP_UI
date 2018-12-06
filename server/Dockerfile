# Build the static assets in the node.js container.
FROM wqp_assets as assets

RUN npm run build


# Base off the community Python image
FROM usgswma/python:3.6

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /server

COPY requirements.txt .
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Add source files and pre-compile them
COPY . /server
RUN python -m compileall -f
RUN python -m compileall -f .

# Copy static files from the assets image to this one.
COPY --from=assets /assets/dist /assets

# Use environment variables for application configuration rather than an
# instance/config.py module.
ENV NO_INSTANCE_CONFIG=1

USER python

EXPOSE 5050

CMD ["gunicorn", "--config", "gunicorn.conf", "wqp:app"]
