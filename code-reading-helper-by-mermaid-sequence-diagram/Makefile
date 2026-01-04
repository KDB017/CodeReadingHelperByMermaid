
YarnOrNPM=npm
VSCE=vsce
TESTSCRIPTS_DIR=./TestScripts
ZIPNAME=code-reading-helper-by-mermaid-sequence-diagram

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
	rm -rf ./out ./docs ./node_modules ./*.zip ./*.vsix ./.vscode-test

pack:
	$(VSCE) package

doc:
	$(YarnOrNPM) run docs

javazip:
	zip -r $(JAVA).zip $(TESTSCRIPTS_DIR)/Java/
pythonzip:	
	zip -r $(PYTHON).zip $(TESTSCRIPTS_DIR)/Python/
typescriptzip:
	zip -r $(TYPESCRIPT).zip $(TESTSCRIPTS_DIR)/Typescript/
javascriptzip:
	zip -r $(JAVASCRIPT).zip $(TESTSCRIPTS_DIR)/JavaScript/


zip: clean
	zip -r $(ZIPNAME).zip .

