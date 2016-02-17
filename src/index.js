/*
* Copyright (c) 2008-2016 the original author or authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import * as $ from 'jquery';
import { derive, LongPollingTransport, CallbackPollingTransport } from 'cometd';

function _setHeaders(xhr, headers) {
    if (headers) {
        for (var headerName in headers) {
            if (headerName.toLowerCase() === 'content-type') {
                continue;
            }
            xhr.setRequestHeader(headerName, headers[headerName]);
        }
    }
}

// Remap toolkit-specific transport calls.
export function LongPollingTransport() {
    var _super = new LongPollingTransport();
    var that = derive(_super);

    that.xhrSend = function(packet) {
        return $.ajax({
            url: packet.url,
            async: packet.sync !== true,
            type: 'POST',
            contentType: 'application/json;charset=UTF-8',
            data: packet.body,
            global: false,
            xhrFields: {
                // For asynchronous calls.
                withCredentials: true
            },
            beforeSend: function(xhr) {
                // For synchronous calls.
                xhr.withCredentials = true;
                _setHeaders(xhr, packet.headers);
                // Returning false will abort the XHR send.
                return true;
            },
            success: packet.onSuccess,
            error: function(xhr, reason, exception) {
                packet.onError(reason, exception);
            }
        });
    };

    return that;
}

export function CallbackPollingTransport() {
    var _super = new CallbackPollingTransport();
    var that = derive(_super);

    that.jsonpSend = function(packet) {
        $.ajax({
            url: packet.url,
            async: packet.sync !== true,
            type: 'GET',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            data: {
                // In callback-polling, the content must be sent via the 'message' parameter.
                message: packet.body
            },
            beforeSend: function(xhr) {
                _setHeaders(xhr, packet.headers);
                // Returning false will abort the XHR send.
                return true;
            },
            success: packet.onSuccess,
            error: function(xhr, reason, exception) {
                packet.onError(reason, exception);
            }
        });
    };

    return that;
}
