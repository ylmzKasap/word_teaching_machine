import datetime
import os
import re
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

# scssFile = sys.argv[1]  For command line
scssFile = 'App.scss'
cssFile = scssFile.strip('scss') + 'css'

if not os.path.exists(scssFile):
    raise FileNotFound(f"Could not locate '{scssFile}'.")

partialRegex = re.compile(r'(?<=@import ").*(?=")')
with open(scssFile, 'r') as sass:
    scssText = sass.read()
partialImports = partialRegex.findall(scssText)

lastCompileTime = compileTime = 0
while True:
    if partialImports:
        for partial in partialImports:
            try:
                partialModifyTime = os.path.getmtime('_' + partial + '.scss')
                if partialModifyTime > compileTime:
                    compileTime = partialModifyTime
            except FileNotFoundError:
                print(f"\nCould not locate the partial named '{partial}'")
                print("Remove it from main scss file if not needed.")
                input('> ')
                sys.exit()

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
