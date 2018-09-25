#!/usr/bin/perl

# Create a list of photos and videos.   Videos are index for 60 second clips for use with web info display page
#   Note:  wmv, .m4v, mov, and .avi  videos must be converted to mp4 for web/html display to work
# .m4v  and .avi?

use strict;
$|++;

use Cwd qw(getcwd);
chdir "..";

my $f_pic  = 'photo_index.txt';
my $f_vid1 = 'video_list.txt';
my $f_vid2 = 'video_index.txt';

#my $find = '/usr/bin/find';
my $find = 'make_index\find.exe';
#my $probe = '/usr/bin/ffprobe';
my $probe = 'make_index\\ffprobe.exe';

# This could be done natively in perl, but is easier/faster with the find command

print "Generating photo index for ../photos ...\n";
system $find . ' ../photos -follow -size +20k -iregex ".*\.\(jpg\|gif\|png\|jpeg\|bmp\)" -print | sort > ' . $f_pic;
print "Generating video index for ../videos ...\n";
system $find . ' ../videos -follow -size +20k -iregex ".*\.\(mp4\)"  -print | sort > ' . $f_vid1;

open (IN,  '<', $f_vid1);
open (OUT, '>', $f_vid2);

while (my $f = <IN>) {
    chomp $f;
    my $i = `$probe "$f"  2>&1`;
#   print "db f=$f i=$i\n";
    if (my ($d) = $i =~ /Duration\: (\S+)/) {
	my ($h, $m, $s) = split ':', $d;
	my $t = $h*60*60 + $m*60 + $s;
	print "f=$f d=$d h=$h m=$m s=$s t=$t\n";
	my $s1 =  0;
	my $s2 = 60;
	while ($s1 < ($t-5)) {
	    my $l = sprintf "%i/%i", $s1/60, $t/60;
	    print OUT "$f#t=$s1,$s2 label=$l\n";
	    $s1 = $s2;  $s2 += 60;
	}
    }
}
