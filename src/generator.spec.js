import {createMultiInsertStatement, productObjectGenerator} from './generator'

describe('sql generation', () => {
    it ('creates single column and single row insert statement', () => {
        expect(createMultiInsertStatement('products', ['sku'], 1)).toEqual(
            'INSERT IGNORE INTO `products` (`sku`) VALUES (?)'
        )
    });

    it ('creates multiple column and single row insert statement', () => {
        expect(createMultiInsertStatement('products', ['sku', 'name', 'description'], 1)).toEqual(
            'INSERT IGNORE INTO `products` (`sku`,`name`,`description`) VALUES (?,?,?)'
        )
    });

    it ('creates multiple column and multi row insert statement', () => {
        expect(createMultiInsertStatement('products', ['sku', 'name'], 5)).toEqual(
            'INSERT IGNORE INTO `products` (`sku`,`name`) VALUES (?,?),(?,?),(?,?),(?,?),(?,?)'
        );
    });

    it ('allows different table name for multi-row insert', () => {
        expect(createMultiInsertStatement('product_suggestions', ['suggestion', 'trigram'], 2)).toEqual(
            'INSERT IGNORE INTO `product_suggestions` (`suggestion`,`trigram`) VALUES (?,?),(?,?)'
        )
    });
    
});

function collectField(field) {
    return object => object[field];
}

function withoutDuplicates(value, index, self) {
    return self.indexOf(value) === index;
}

describe('Product data generation', () => {
    it ('generates unique product SKU on each call', () => {
        expect([...productObjectGenerator(3)].map(collectField('sku')).filter(withoutDuplicates))
            .toEqual(['SKU1', 'SKU2', 'SKU3']);
    })

    it ('generates unique product names', () => {
        expect([...productObjectGenerator(3)].map(collectField('name')).filter(withoutDuplicates).length)
            .toEqual(3);
    })
});

