FROM node:8
RUN useradd -m "user"
USER "user"
RUN mkdir /home/user/app
WORKDIR /home/user/app
ADD package.json package.json
ADD yarn.lock yarn.lock
ADD .babelrc .babelrc
ADD webpack/ webpack/
ADD src/ src/
RUN yarn
