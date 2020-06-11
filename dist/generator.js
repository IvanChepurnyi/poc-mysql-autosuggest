"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMultiInsertStatement = createMultiInsertStatement;
exports.productObjectGenerator = productObjectGenerator;
exports.default = _default;

var _mysql = require("mysql");

var _nGram = _interopRequireDefault(require("n-gram"));

var _faker = _interopRequireDefault(require("faker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const batchSize = 1000;

function quoteIdentifier(identifier) {
  return '`' + identifier + '`';
}

function createMultiInsertStatement(table, fields, rowCount) {
  const fieldList = fields.map(quoteIdentifier).join();
  const placeHolder = fields.map(() => '?').join();
  const rows = `(${placeHolder}),`.repeat(rowCount);
  return `INSERT IGNORE INTO ${quoteIdentifier(table)} (${fieldList}) VALUES ${rows.substr(0, rows.length - 1)}`;
}

function* productObjectGenerator(numberOfRecords) {
  for (let i = 1; i <= numberOfRecords; i++) {
    const adjective = _faker.default.commerce.productAdjective();

    const material = _faker.default.commerce.productMaterial();

    const type = _faker.default.commerce.product();

    yield {
      sku: 'SKU' + i,
      name: `${adjective} ${material} ${type}`,
      type: type,
      material: material,
      price: _faker.default.commerce.price(),
      brand: _faker.default.random.arrayElement(['Prada', 'Gucci', 'Lacoste', 'Woolrich', 'D&G'])
    };
  }
}

function _default(connectionSettings) {
  const connection = (0, _mysql.createConnection)(connectionSettings);
  return {
    generateRecords(totalRecords) {
      const dataGenerator = productObjectGenerator(totalRecords);
      const batchSize = 2000;

      const onEachQuery = err => {
        if (err) throw err;

        if (totalRecords <= 0) {
          connection.end();
          return;
        }

        const productData = [];
        const suggestionData = [];
        const rowsToAdd = Math.min(batchSize, totalRecords);

        for (let i = 0; i < rowsToAdd; i++) {
          let product = dataGenerator.next().value;
          productData.push(product.sku, product.name, product.price, product.brand);
          let suggestion = `${product.brand} ${product.material} ${product.type}`;
          suggestionData.push(suggestion, _nGram.default.trigram(suggestion).join(' '));
        }

        totalRecords -= rowsToAdd;
        connection.query({
          sql: createMultiInsertStatement('products', ['sku', 'name', 'price', 'brand'], rowsToAdd),
          values: productData
        }, err => {
          if (err) throw err;
          connection.query({
            sql: createMultiInsertStatement('product_suggestions', ['suggestion', 'trigram'], rowsToAdd),
            values: suggestionData
          }, onEachQuery);
        });
      };

      connection.connect(() => {});
      onEachQuery();
    },

    suggestKeywords(keyword) {
      const trigram = _nGram.default.trigram(keyword).join(' ');

      connection.connect();
      connection.query({
        sql: 'SELECT suggestion, MATCH (trigram) AGAINST (? IN NATURAL LANGUAGE MODE) as score FROM product_suggestions WHERE MATCH(trigram) AGAINST(? IN NATURAL LANGUAGE MODE) LIMIT 5',
        values: [trigram, trigram]
      }, (err, result) => {
        for (let item of result) {
          console.log('Suggestion: ' + item.suggestion + ', score: ' + item.score);
        }

        connection.end();
      });
    }

  };
}