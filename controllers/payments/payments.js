const stripe = require('stripe')('sk_test_51MwDleIwsetuaGMFhpPXCbL7WO5kR8pKrAvllLkAlGVUfaReUkrEglfduHn1iliu016smUMh7l84gtRjoLiJOVUY007kfkdegr');

/* *** test *** */
function test (req, res) {
    res.status(200).send({
      message:'Hello World! from payments!'
    });
}

async function createCheckOutSession(req, res){
    let item = req.body;
    console.log(req.body);
    console.log(item);
    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price_data: {
                    currency: 'mxn', 
                    product_data: {
                        name: item.name,
                        images: [item.image],
                    }, 
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
              },
            ],
            mode: 'payment',
            success_url: item.success,
            cancel_url: item.success,
            //cancel_url: item.cancel,
          });
          //console.log(session);
    
        return res.status(200).json(session);

    } catch (error) {
        console.log(error);
        return res.status(500).send({message: 'Error: ' + error});
    }
}

module.exports = {
    test,
    createCheckOutSession,
}