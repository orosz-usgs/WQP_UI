
def is_huc2(hucid):
    '''
    :param hucid: String
    :return: Boolean
    '''
    return hucid.isdigit() and len(hucid) == 2

def is_huc8(hucid):
    '''
    :param hucid: String
    :return: Boolean
    '''
    return hucid.isdigit() and len(hucid) == 8