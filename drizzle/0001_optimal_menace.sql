CREATE TABLE `company_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`empresaNome` varchar(255) NOT NULL,
	`cnpj` varchar(20),
	`setor` varchar(100),
	`cidade` varchar(100),
	`companyData` json NOT NULL,
	`analysisResult` json NOT NULL,
	`scoreGeral` int NOT NULL,
	`scoreFinanceiro` int NOT NULL,
	`scoreComercial` int NOT NULL,
	`scoreOperacional` int NOT NULL,
	`scorePessoas` int NOT NULL,
	`scoreTecnologia` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_analyses_id` PRIMARY KEY(`id`)
);
