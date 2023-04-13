﻿CREATE TABLE [dbo].[Invoice]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [InvoiceNumber] VARCHAR(MAX) NOT NULL,
    [ClientId] INT NOT NULL, 
    [SaleId] INT NOT NULL,
    [Description] VARCHAR(MAX) NULL, 
    [InvoiceDate] DATETIME2 NOT NULL DEFAULT getutcdate(), 
    [PaymentDueDate] DATETIME2 NOT NULL, 
    [AmountDue] MONEY NOT NULL, 
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CONSTRAINT [FK_Invoice_ToClient] FOREIGN KEY (ClientId) REFERENCES Client(Id) 
)
