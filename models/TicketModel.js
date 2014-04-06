// Ticket.js
var utils = require('../lib/utils');
var async = require('async');

var mongoose = require('mongoose');
extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');


// TicketModel schema
var TicketModelSchema = new Schema({
    name: {type: String, trim: true},
    classification: { type: Schema.ObjectId, ref: 'classification'},
    classification_name: { type: String },
    // TODO: auto generated by user type
    source_actor_type: {type: Schema.ObjectId, ref: 'actor_source_type'},
    source_actor_type_name: {type: String},
    target_actor_type: {type: Schema.ObjectId, ref: 'actor_target_type'},
    target_actor_type_name: {type: String},

    contact_phone: {type: String},
    contact_mobile: {type: String},
    contact_email: {type: String},

    quantity: {type: Number},
    description: {type: String},
    keywords: [{type: String}],

    address: { type: String, trim: true},

    creation_date: {type: Date, default: Date.now},
    end_date: {type: Date, default: addDate()},
    start_date: {type: Date, default: Date.now},
    expiration_date: {type: Date, default: addDate()},

    is_active: {type: Number, default: 1},
    statut: {type: Number, default: 0},
    reference: {type: String},
    user: {type: Schema.ObjectId, ref: 'user'}
});


/**
 * Validations
 */
var validation_fields = [
    'name',
    'classification',
    'source_actor_type',
    'target_actor_type',
    'description',
];

for (var index=0; index<validation_fields.length; index++) {
    TicketModelSchema.path(validation_fields[index]).required(true, 'Field ' + validation_fields[index] + ' cannot be blank')
}


/**
 * Pre save
 */
TicketModelSchema.pre('save', function(next) {
    this.keywords = this.generateKeyWords();
    this.reference = utils.makeRef();
    next();
});


/**
 * Inheritance
 */
TicketModelSchema.inherits = {
    // TODO, create pre save to update and generateKeyWords
    creatAndSave: function() {
        // auto generate keywords
        // this.keywords = generateKeyWords(this.name);
        this.save();
    },
    // data = {name: String, description: String, actor_type: ObjectId}
    update: function(data, cb) {
        for (property in data) {
            this[property] = data[property];
        }
        // this.keywords = generateKeyWords(this.name);
        this.save(cb);
    },
    generateKeyWords: function() {
        var keywords = [];
        if (this.name) {
            var name = this.name.toLowerCase();
            var arr = name.split(' ');
            for (var index=0; index<arr.length; index++) {
                if (utils.worthlesswords.indexOf(arr[index]) < 0) {
                    keywords.push(arr[index]);
                }
            }
        }
        return keywords;
    }
};


/**
 * Statics
 */
TicketModelSchema.statics = {
    // Find ticket by id
    // TODO: .populate('_user');
    // TODO: set a variable option to decide a load of json or not
    // TODO: id not found
    load: function(id, cb) {
        this.findOne({ _id: id }).exec(cb);
    },

    loadJson: function(id, cb) {
        this.find({ _id: id }).lean().exec(cb);
    },

    // List articles
    // TODO: pagination, populate(_user)
    list: function (options, cb) {
        var criteria = options.criteria || {};
        this.find(criteria).exec(cb);
    },

    // List to Json
    listToJson: function(options, cb) {
        var criteria = options.criteria || {};
        this.find(criteria).lean().exec(cb);
    },

    // find key in fields
    findObjectByKeyword: function(field, key, list, cb) {
        var target_list = list || [];
        var rule = {};
        rule[field] = new RegExp(key, 'i');

        if (target_list.length == 0) {
            this.find(rule)
                .exec(cb);
        }
        else {
            this.find(rule)
                .where('_id').in(target_list)
                .exec(cb);
        }
    },
    // Find tickets by classification_id
    findByClassification: function(classification_id, cb) {
        this.find()
            .where('classification').equals(classification_id)
            .exec(cb);
    },
    // Find tickets by author type id
    findByActorType: function(actor_id, cb) {
        this.find()
            .where('source_actor_type').equals(actor_id)
            .exec(cb);
    },
    // Find tickets by author type and classification (matching)
    findByActorTypeAndClassification: function(actor_id, classification_id, cb) {
        this.find()
            .where('classification').equals(classification_id)
            .where('source_actor_type').equals(actor_id)
            .exec(cb);
    },
    findIdByActorTypeAndClassification: function(actor_id, classification_id, cb) {
        this.find()
            .where('classification').equals(classification_id)
            .where('source_actor_type').equals(actor_id)
            .exec(cb);
    },
    findTicketByReference: function(ref, cb) {
        this.findOne({ reference: ref }).exec(cb);
    }
}

// TODO: Add this in lib/utils.js
function addDate() {
    var now = new Date()
    var dt = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    return dt;
}


// For the first step we generate keywords by name
// eliminating the worthless words in French language
// TODO: count occur times of keywords
// function generateKeyWords(name) {
    // var keywords = [];
    // name = name.toLowerCase();
    // var arr = name.split(' ');
    // for (var index=0; index<arr.length; index++) {
        // if (utils.worthlesswords.indexOf(arr[index]) < 0) {
            // keywords.push(arr[index]);
        // }
    // }
    // return keywords;
// }


// Built and exports Model from Schema
mongoose.model('TicketModel', TicketModelSchema);
exports.TicketModel = mongoose.model('TicketModel');
// var TicketModel = exports.TicketModel = mongoose.model('TicketModel');

// Export Schema
exports.TicketModelSchema = TicketModelSchema;
