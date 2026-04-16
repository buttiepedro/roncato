import requests, os
from flask import current_app
from ..extensions import socketio

def notify_status_change(order):
    # Socket emit
    socketio.emit('order_updated', order.to_dict())
    
    # Webhook n8n status
    url = current_app.config.get('N8N_STATUS_WEBHOOK')
    if url:
        try: requests.post(url, json={'id': order.id, 'status': order.status})
        except: pass

    # Webhook n8n finalizado
    if order.status == 'delivered':
        url_fin = current_app.config.get('N8N_FINALIZE_WEBHOOK')
        if url_fin:
            try: requests.post(url_fin, json={'id': order.id, 'status': 'delivered'})
            except: pass