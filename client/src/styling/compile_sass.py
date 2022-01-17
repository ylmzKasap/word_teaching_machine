import datetime
import os
import re
from pathlib import Path
import subprocess
import sys
import time


class FileNotFound(Exception):
    pass


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
    # Create Sass import names from relative paths.
    if len(file_path.split('/')) > 1:
        return (
            './' + os.path.dirname(file_path)
            + '/' + os.path.basename(file_path).lstrip("_").split('.')[0])
    else:
        return file_path.lstrip('_').split('.')[0]

        
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
    print("\nDelete the partial from main scss file if not necessary.")
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

# Notify the user for not imported partials.
if notImported:
    print("\nSome partials exist within the directory but they are not imported:\n")
    for i, partial in enumerate(notImported, 1):
        print(f'{i}. {partial}')
    print("\nAdd the partials to the main scss file if they are necessary.")
    print("\nComplete import paths:\n")
    for p in intersectingPartials:
        importName = get_import_name(p)
        print(f'@import "{importName}";')
    print("\nNot imported")
    for p in notImported:
        relativePath = str(p).split(str(Path.cwd()))[1].strip(os.sep).replace(os.sep, "/")
        importName = get_import_name(relativePath)
        print(f'@import "{importName}";')
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
        os.system('cls')
        print('\nCompiling...')
        subprocess.run(
            ['sass', scssFile, cssFile], shell=True
            )
        lastCompileTime = compileTime

    os.system('cls')
    print(f"\nWatching changes on {scssFile}"
          + f"{' and ' + str(len(partialImports)) + ' partials' if partialImports else ''}:")
    print("\nLast compile time:")
    readableTime = datetime.datetime.fromtimestamp(compileTime)
    print(readableTime.strftime('%H:%M:%S | %d.%m.%Y'))
    print(f"\n{read_time(datetime.datetime.now() - readableTime)} ago.")
    time.sleep(1)
