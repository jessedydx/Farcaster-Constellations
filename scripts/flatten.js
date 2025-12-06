const fs = require('fs');
const path = require('path');

// OpenZeppelin contracts in correct dependency order (base first, derived last)
const contracts = [
    // Base interfaces and utilities first
    '@openzeppelin/contracts/utils/introspection/IERC165.sol',
    '@openzeppelin/contracts/utils/Context.sol',
    '@openzeppelin/contracts/utils/Panic.sol',
    '@openzeppelin/contracts/utils/math/SafeCast.sol',
    '@openzeppelin/contracts/utils/math/Math.sol',
    '@openzeppelin/contracts/utils/math/SignedMath.sol',
    '@openzeppelin/contracts/utils/Strings.sol',

    // Then ERC165 implementation
    '@openzeppelin/contracts/utils/introspection/ERC165.sol',

    // Then ERC721 interfaces
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721.sol',
    '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol',

    // ERC721 utilities (must come before ERC721)
    '@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol',

    // Then ERC721 implementation
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',

    // Then extension interfaces
    '@openzeppelin/contracts/interfaces/IERC4906.sol',

    // Then extensions
    '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol',

    // Finally ownership
    '@openzeppelin/contracts/access/Ownable.sol'
];

const mainContract = fs.readFileSync('contracts/FarcasterConstellationNFTV2.sol', 'utf8');
let flattened = '// SPDX-License-Identifier: MIT\n';
flattened += `// Flattened from: FarcasterConstellationNFTV2.sol\n\n`;
flattened += `pragma solidity ^0.8.20;\n\n`;

// Read and merge all dependencies
const processedFiles = new Set();

function getContractContent(contractPath) {
    if (processedFiles.has(contractPath)) return '';
    processedFiles.add(contractPath);

    try {
        const fullPath = path.join('node_modules', contractPath);
        let content = fs.readFileSync(fullPath, 'utf8');

        // Remove SPDX and pragma
        content = content.replace(/\/\/ SPDX-License-Identifier:.*\n/g, '');
        content = content.replace(/pragma solidity.*;\n/g, '');

        // Remove imports
        content = content.replace(/import\s+.*;\n/g, '');

        return content + '\n';
    } catch (e) {
        console.warn(`Could not read ${contractPath}`);
        return '';
    }
}

// Add all OpenZeppelin contracts
contracts.forEach(contract => {
    flattened += getContractContent(contract);
});

// Add main contract (clean)
let mainClean = mainContract.replace(/\/\/ SPDX-License-Identifier:.*\n/, '');
mainClean = mainClean.replace(/pragma solidity.*;\n/, '');
mainClean = mainClean.replace(/import\s+.*;\n/g, '');

flattened += mainClean;

fs.writeFileSync('contracts/FarcasterConstellationNFTV2_Flattened.sol', flattened);
console.log('✅ Flattened contract created: contracts/FarcasterConstellationNFTV2_Flattened.sol');
