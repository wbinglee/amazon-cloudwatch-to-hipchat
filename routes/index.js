/**
 * Recieve a POST from Amazon SNS
 */
exports.index = function(req, res){
    var request = require('request');

    console.log(req.text);
    var sns = JSON.parse(req.text);

    var roomid = req.params.roomid
    
    var hipchatFrom = "Amazon+SNS"

    // Is this a subscribe message?
    if (sns.Type == 'SubscriptionConfirmation') {
        request(sns.SubscribeURL, function (err, result, body) {
            if (err || body.match(/Error/)) {
                console.log("Error subscribing to Amazon SNS Topic", body);
                return res.send('Error', 500);
            }

            console.log("Subscribed to Amazon SNS Topic: " + sns.TopicArn);
            res.send('Ok');
        });
    } else if (sns.Type == 'Notification') {
        var message = '';
        if (sns.Subject === undefined) {
            message = JSON.stringify(sns.Message);
        } else {
            message = sns.Subject + '\n' + sns.Message;
        }

        var hipchatUrl = 'https://api.hipchat.com/v1/rooms/message?' +
                    'auth_token=' + process.env.HIPCHAT_API_TOKEN + '&' +
                    'room_id=' + roomid + '&' +
                    'from=' + hipchatFrom + '&' +
                    'message=' + message + '&' +
                    'notify=1&' +
                    'format=json';

        request(hipchatUrl, function (err, result, body) {
            if (err) {
                console.log("Error sending message to HipChat", err, hipChatUrl, body);
                return res.send('Error', 500);
            }

            console.log("Sent message to HipChat", hipchatUrl);

            res.send('Ok');
        });
    }
};
