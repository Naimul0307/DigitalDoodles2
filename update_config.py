import json
import socket

def get_current_ip():
    hostname = socket.gethostname()
    return socket.gethostbyname(hostname)

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def update_config_file(ip_address, port_number, config_file='config.json'):
    with open(config_file, 'r') as f:
        config = json.load(f)

    config['IP'] = ip_address
    config['PORT'] = port_number

    with open(config_file, 'w') as f:
        json.dump(config, f, indent=4)

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

if __name__ == '__main__':
    current_ip = get_current_ip()
    default_port = 5003

    if is_port_in_use(default_port):
        port_number = find_free_port()
    else:
        port_number = default_port

    update_config_file(current_ip, port_number)
