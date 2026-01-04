ZIPNAME=CodeReadingHelperByMermaid
CURRENTDIR=$(shell pwd)
ZIPFILE=$(ZIPNAME).zip
EXCLUDE=--exclude=.git\* --exclude=*.zip --exclude=*.log

all: 
	zip -r $(ZIPFILE) . $(EXCLUDE)
	@echo "Created $(ZIPFILE) in $(CURRENTDIR)"