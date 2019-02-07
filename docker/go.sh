#!/bin/bash

die() {
  echo "$*" >&2
}

realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

usage() {
  cat <<-__EOF

    Time loading of web pages

    Usage: $0 [-h] [-b] URL [URL] [URL]...

    Flags:
      -h             Show usage and exit
      -b             Rebuild the container before running it
      -o DIRNAME     Set output directory [default=out]
__EOF
}

OUTDIR=out
while getopts ":hbo:"  OPT; do
  [[ $OPTARG =~ ^- ]] && die "Option -$OPT requires an argument."
  case $OPT in
    :)
      die "Option -$OPTARG requires an argument."; ;;
    \?)
      usage
      die "Unrecognized flag $OPTARG"; ;;
    h)
      usage; exit; ;;
    b)
      docker build -t webcapture . ;;
    o)
      OUTDIR=$OPTARG ; ;;
  esac
done
shift $((OPTIND-1))

[ -d $OUTDIR ] || mkdir $OUTDIR || die "Could not create output $(realpath $OUTDIR) directory"

docker run --user 1000:1000 -v $(realpath $OUTDIR):/tmp/capture webcapture multiple_capture.js /tmp/capture $*


printf "%-32s %7s %7s\n" "Site" "DNS" "Load"
for file in $OUTDIR/*.log ; do
  awk '
    BEGIN{go=0;}
    {gsub(",", "");}
    /"performance" :/{go=1; next;}
    go==1 && /requestStart/ {rs=$2; next;}
    go==1 && /domComplete/ {dc=$2; next;}
    go==1 && /domainLookupStart/ {dnss=$2; next;}
    go==1 && /domainLookupEnd/ {dnse=$2; next;}
    END{
      s = FILENAME; gsub(/^.*\/|\.log$/, "", s);
      printf("%-32s %7d %7d\n", s, dnse-dnss, dc-rs);}
  ' $file
done







