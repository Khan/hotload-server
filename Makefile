dist/index.js: src
	./build.sh

.PHONY: deps
deps:
	npm install
	mkdir -p dist
