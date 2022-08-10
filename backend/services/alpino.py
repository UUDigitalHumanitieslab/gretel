from django.conf import settings

import socket
from lxml import etree


class AlpinoError(RuntimeError):
    pass


def _get_alpino_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect((settings.ALPINO_HOST, settings.ALPINO_PORT))
    except ConnectionRefusedError:
        s.close()
        raise
    return s


def parse_sentence(sentence: str) -> str:
    # Alpino only supports IPv4, so we only connect using socket.AF_INET
    result = bytearray()
    s = _get_alpino_socket()
    s.sendall((sentence + '\n\n').encode())
    while True:
        answer = s.recv(4096)
        if answer == b'':
            break
        result.extend(answer)
    s.close()
    result_bytes = bytes(result)

    # Check if an error was returned
    if result_bytes.startswith(b'Error:'):
        raise AlpinoError(result_bytes.decode())

    # Check if result is valid XML
    try:
        etree.fromstring(result_bytes)
    except etree.XMLSyntaxError:
        raise AlpinoError('Invalid XML returned')
    return result_bytes.decode()
