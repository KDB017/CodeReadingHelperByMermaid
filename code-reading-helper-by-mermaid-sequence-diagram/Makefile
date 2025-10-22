
YarnOrNPM=npm
all:
	test
test:
	$(YarnOrNPM) run vscode:prepublish
compile:
	$(YarnOrNPM) run compile
lint:
	$(YarnOrNPM) run lint
unittest:
	$(YarnOrNPM) test
watch:
	$(YarnOrNPM) run watch

clean:
	rm -rf ./out ./node_modules