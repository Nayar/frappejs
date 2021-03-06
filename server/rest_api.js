const frappe = require('frappejs');

module.exports = {
    setup(app) {
        // get list
        app.get('/api/resource/:doctype', frappe.async_handler(async function(request, response) {
            for (key of ['fields', 'filters']) {
                if (request.query[key]) {
                    request.query[key] = JSON.parse(request.query[key]);
                }
            }

            let data = await frappe.db.get_all({
                doctype: request.params.doctype,
                fields: request.query.fields,
                filters: request.query.filters,
                start: request.query.start || 0,
                limit: request.query.limit || 20,
                order_by: request.query.order_by,
                order: request.query.order
            });

            return response.json(data);
        }));

        // create
        app.post('/api/resource/:doctype', frappe.async_handler(async function(request, response) {
            data = request.body;
            data.doctype = request.params.doctype;
            let doc = frappe.new_doc(data);
            await doc.insert();
            await frappe.db.commit();
            return response.json(doc.get_valid_dict());
        }));

        // update
        app.put('/api/resource/:doctype/:name', frappe.async_handler(async function(request, response) {
            data = request.body;
            let doc = await frappe.get_doc(request.params.doctype, request.params.name);
            Object.assign(doc, data);
            await doc.update();
            await frappe.db.commit();
            return response.json(doc.get_valid_dict());
        }));


        // get document
        app.get('/api/resource/:doctype/:name', frappe.async_handler(async function(request, response) {
            let doc = await frappe.get_doc(request.params.doctype, request.params.name);
            return response.json(doc.get_valid_dict());
        }));

        // get value
        app.get('/api/resource/:doctype/:name/:fieldname', frappe.async_handler(async function(request, response) {
            let value = await frappe.db.get_value(request.params.doctype, request.params.name, request.params.fieldname);
            return response.json({value: value});
        }));

        // delete
        app.delete('/api/resource/:doctype/:name', frappe.async_handler(async function(request, response) {
            let doc = await frappe.get_doc(request.params.doctype, request.params.name)
            await doc.delete();
            return response.json({});
        }));
    }
};
