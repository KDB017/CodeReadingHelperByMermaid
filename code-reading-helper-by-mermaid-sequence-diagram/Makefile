
YarnOrNPM=npm
VSCE=vsce

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
	rm -rf ./out ./docs

pack:
	$(VSCE) package

doc:
	$(YarnOrNPM) run docs
