import datetime
import os
import re
from pathlib import Path
import subprocess
import sys
import time


class FileNotFound(Exception):
    pass


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def read_time(timedeltaObject):
    timeInSeconds = timedeltaObject.seconds
    if timedeltaObject.days > 0:
        return str(timedeltaObject)
    elif timeInSeconds < 10:
        return 'A few seconds'
    elif timeInSeconds < 60:
        return f'{timeInSeconds} seconds' if timeInSeconds > 1 else f'{timeInSeconds} second'
    elif timeInSeconds < 3600:
        minutes, seconds = divmod(timeInSeconds, 60)
        return f'{minutes} minutes' if minutes > 1 else f'{minutes} minute'
    elif timeInSeconds < 86400:
        hours, minutes = divmod(timeInSeconds, 3600)
        minutes, seconds = divmod(minutes, 60)
        return (
            (f'{hours} hours' if hours > 1 else f'{hours} hour')
            + (f' {minutes} minutes' if minutes > 1 else f' {minutes} minute')
            )


def get_import_name(file_path):
    """Create Sass import names from relative paths."""
    if len(file_path.split('/')) > 1:
        return (
            './' + os.path.dirname(file_path)
            + '/' + os.path.basename(file_path).lstrip("_").split('.')[0])
    else:
        return file_path.lstrip('_').split('.')[0]


def send_media_end(item):
    """Helper function for sorting media queries."""
    if 'media' in item:
        return 1
    else:
        return 0

        
# scssFile = sys.argv[1]  For command line
scssFile = 'App.scss'
cssFile = scssFile.strip('scss') + 'css'

if not os.path.exists(scssFile):
    raise FileNotFound(f"Could not locate '{scssFile}'.")

# Find imported partials.
partialRegex = re.compile(r'(?<=@import ").*(?=")')
with open(scssFile, 'r') as sass:
    scssText = sass.read()
partialImports = partialRegex.findall(scssText)

# Check duplicate imports.
if (len(partialImports) != len(set(partialImports))):
    duplicate = [i for i in partialImports if partialImports.count(i) > 1]
    print("\nThere are duplicate imports in the main scss file:\n")
    for i, dupe in enumerate(set(duplicate), 1):
        print(f"{i}. {dupe}")
    input("\nRemove the duplicates and restart the compiler.")
    sys.exit()

# Find paths of all partials.
availablePartialPaths = []
for folderPath, subFolder, fileNames in os.walk(Path.cwd()):
    for file in fileNames:
        if file.startswith('_') and file.endswith('.scss'):
            availablePartialPaths.append(Path(folderPath, file))
availablePartials = []
for partial in availablePartialPaths:
    availablePartials.append(
        str(partial).split(str(Path.cwd()))[1]
        .strip(os.sep).replace(os.sep, "/"))

# Add underscore and extension to the imported partials.
importedPartials = []
for partial in partialImports:
    if partial.startswith("."):
        importedPartials.append(
            os.path.dirname(partial).lstrip('./') +  '/_' + os.path.basename(partial) + '.scss')
    else:
        importedPartials.append('_' + partial + '.scss')

# Check for incorrectly imported partials.
importedNotFound = [p for p in importedPartials if p not in availablePartials]
if importedNotFound:
    print("\nSome partials are imported but they do not exist:\n")
    for i, partial in enumerate(importedNotFound, 1):
        print(f'{i}. {partial}')
    print("\nDelete the partial from main scss file to compile.")
    input()
    sys.exit()

# Find out not imported partials.
intersectingPartials = [p for p in importedPartials if p in availablePartials]
intersectingPaths = []
notImported = []
for partial in availablePartialPaths:
    relativePath = str(partial).split(str(Path.cwd()))[1].strip(os.sep).replace(os.sep, "/")
    if relativePath in intersectingPartials:
        intersectingPaths.append(partial)
    else:
        notImported.append(partial)

# Get Sass import names for all files.
intersectingImports = [get_import_name(p) for p in intersectingPartials]
toBeImported = [
    get_import_name(
        str(p).split(str(Path.cwd()))[1].strip(os.sep).replace(os.sep, "/")) 
        for p in notImported]
allImports = [*intersectingImports, *toBeImported]

# Send media queries to the end.
toBeImported.sort(key=send_media_end)
allImports.sort(key=send_media_end)

# Notify the user for not imported partials.
if notImported:
    print("\nSome partials exist within the directory but they are not imported:\n")
    for i, partial in enumerate(notImported, 1):
        print(f'{i}. {partial}')
    print("\nAdd the partials to the main scss file if they are necessary and restart the compiler.")

    print("\n\nPartials which are not imported:")
    for i in toBeImported:
        print(f'@import "{i}";')
    
    print("\nComplete import paths:")
    for i in allImports:
        print(f'@import "{i}";')
    input()

lastCompileTime = compileTime = 0
while True:
    if partialImports:
        for partial in intersectingPaths:
            partialModifyTime = os.path.getmtime(partial)
            if partialModifyTime > compileTime:
                compileTime = partialModifyTime

    mainModifyTime = os.path.getmtime(scssFile)
    if mainModifyTime > compileTime:
        compileTime = mainModifyTime

    if compileTime != lastCompileTime:
        clear_screen()
        print('\nCompiling...')
        if os.name == 'nt':
            subprocess.run(
                ['sass', scssFile, cssFile], shell=True)
        else:
            subprocess.run(['sass', scssFile, cssFile])
        lastCompileTime = compileTime

    clear_screen()
    print(f"\nWatching changes on {scssFile}"
          + f"{' and ' + str(len(partialImports)) + ' partials' if partialImports else ''}:")
    print("\nLast compile time:")
    readableTime = datetime.datetime.fromtimestamp(compileTime)
    print(readableTime.strftime('%H:%M:%S | %d.%m.%Y'))
    print(f"\n{read_time(datetime.datetime.now() - readableTime)} ago.")
    time.sleep(1)
