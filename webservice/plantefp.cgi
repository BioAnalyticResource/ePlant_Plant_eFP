#!/usr/bin/python
# Rewritten by Asher to accept Special HTML characters
import cgi
import json
import urllib
import urllib2
print 'Content-Type: application/json\n'

try:
    # Retrieve parameters
    arguments = cgi.FieldStorage()
    samples = json.loads(arguments['samples'].value)
    id = arguments['id'].value
    datasource = arguments['datasource'].value

    output = []

    for sample in samples:
        query_args = {'dataSource': datasource, 'primaryGene': id, 'sample': sample }
        encoded_args = urllib.urlencode(query_args)

        url = 'https://bar.utoronto.ca/~asher/eplant/cgi-bin/agiToSignal.php?' + encoded_args
        response = json.loads(urllib2.urlopen(url).read())
        
        output.append({
            'name': sample,
            'value': response[response.keys()[0]]
        })

    print json.dumps(output)
except:
    print "[]"
