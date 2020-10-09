// swap hash/dictionary
var swap = function(hash) {
    var result = {}
    for (var key in hash) {
        result[hash[key]] = key;
    }
    return result;
}

// uppercase first character
var ufl = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// amino acid codes
const amino_1 = {
    'A': 'ALA',
    'C': 'CYS',
    'D': 'ASP',
    'E': 'GLU',
    'F': 'PHE',
    'G': 'GLY',
    'H': 'HIS',
    'I': 'ILE',
    'K': 'LYS',
    'L': 'LEU',
    'M': 'MET',
    'N': 'ASN',
    'P': 'PRO',
    'Q': 'GLN',
    'R': 'ARG',
    'S': 'SER',
    'T': 'THR',
    'V': 'VAL',
    'W': 'TRP',
    'Y': 'TYR'
};
const amino_3 = swap(amino_1);

// get content from URL
function ajax(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
        resolve(this.responseText);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.send();
    });
}

// select all checkboxes
$('#select').click(function(event) {
    $(':checkbox').each(function() {
        this.checked = true;
    })
})

// deselect all checkboxes
$('#deselect').click(function(event) {
    $(':checkbox').each(function() {
        this.checked = false;
    })
})

// build scaffold
var scaffold = function(id) {
    var item = ' &mdash; Query: <a id="' + id + '_a" target="_blank">…</a>';
    return item;
}

// translate 3-letter code to 1-letter code
$('#protein-3').focusout(function () {
    const regex = /^p\.([A-Za-z]{3})(\d+)([A-Za-z]{3})$/.exec($('#protein-3').val());
    if (regex && regex.length == 4) {
        $('#protein-1').val('p.' + amino_3[regex[1].toUpperCase()] + regex[2] + amino_3[regex[3].toUpperCase()]);
    }
})

$('#protein-1').focusout(function () {
    const regex = /^p\.([A-Za-z])(\d+)([A-Za-z])$/.exec($('#protein-1').val());
    if (regex && regex.length == 4) {
        $('#protein-3').val('p.' + ufl(amino_1[regex[1].toUpperCase()]) + regex[2] + ufl(amino_1[regex[3].toUpperCase()]));
    }
})

$('.input:text').keypress(function (e) {
    if (e.which == 13) {
        $('#build').click();
        return false;
    }
});

// submit query button
$('#build').click(function(event) {
    $('#queries').html('');
    const gene = $('#gene').val();
    const protein_3 = $('#protein-3').val();
    const protein_1 = $('#protein-1').val();
    const dna = $('#dna').val();
    const checkboxes = $('input:checked');
    for (let i = 0; i < checkboxes.length; i++) {
        const el = checkboxes[i];
        $('#' + el.id).siblings('.query').html(scaffold(el.id));
        const link = $('#' + el.id + '_a');
        if (el.id == 'ClinVar') {
            link.attr('href', 'https://www.ncbi.nlm.nih.gov/clinvar?term=' + gene + '[Gene Name]+AND+' + protein_3);
            link.html(gene + '[Gene]+AND+' + protein_3);
        }
        if (el.id == 'COSMIC') {
            link.attr('href', 'https://cancer.sanger.ac.uk/cosmic/search?q=' + gene + '+' + protein_1);
            link.html(gene + '+' + protein_1);
        }
        if (el.id == 'CIViC') {
            // parse JSON file
            ajax('https://civicdb.org/api/genes/' + gene + '?identifier_type=entrez_symbol')
                .then(function(result) {
                    // get gene ID
                    const res = JSON.parse(result);
                    const geneID = res.id;
                    var variantID = -1;
                    if (geneID !== undefined) {
                        // get variant ID
                        res.variants.forEach(item => {
                            if (item.name == protein_1.slice(2)) {
                                variantID = item.id;
                            }
                        });
                        if (variantID >= 0) {
                            link.attr('href', 'https://civicdb.org/events/genes/' + geneID + '/summary/variants/' + variantID + '/summary#variant');
                            link.html(geneID + '/summary/variants/' + variantID + '/summary#variant');
                        } else {
                            link.attr('href', 'https://civicdb.org/events/genes/' + geneID + '/summary');
                            link.html(geneID + '/summary');
                        }
                    } else {
                        link.attr('href', 'https://civicdb.org/search/evidence/');
                        link.html('no results: please search manually');
                    }
                })
                .catch(function() {
                    link.attr('href', 'https://civicdb.org/search/evidence/');
                    link.html('no results: please search manually');
                });
        }
        if (el.id == 'VarSome') {
            link.attr('href', 'https://varsome.com/variant/hg19/' + gene + '%20' + protein_3.slice(2));
            link.html(gene + ' ' + protein_3.slice(2));
        }
        if (el.id == 'dbSNP') {
            link.attr('href', 'https://www.ncbi.nlm.nih.gov/snp/?term=' + gene + '[Gene Name]+AND+' + protein_3.slice(2));
            link.html(gene + '[Gene Name]+AND+' + protein_3.slice(2));
        }
        if (el.id == 'OncoKB') {
            link.attr('href', 'https://www.oncokb.org/gene/' + gene + '/' + protein_1.slice(2));
            link.html(gene + '/' + protein_1.slice(2));
        }
    }
})
