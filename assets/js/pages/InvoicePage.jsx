import React, { useState, useEffect } from 'react';
import Select from '../components/forms/Select';
import { Link } from 'react-router-dom';
import Field from '../components/forms/Field';
import CustomersAPI from "../services/customersAPI";
import InvoicesAPI from "../services/invoicesAPI"

const InvoicePage = ({ history, match }) => {

    const { id = "new" } = match.params;

    const [editing, setEditing] = useState(false);

    const [invoice, setInvoice] = useState({
        amount: "",
        customer: "",
        status: "SENT"
    });

    const [customers, setCustomers] = useState([]);

    const [errors, setErrors] = useState({
        amount: "",
        customer: "",
        status: ""
    });

    //Récupération des clients
    const fetchCustomers = async () => {
        try{
            const data =  await CustomersAPI.findAll();
            setCustomers(data);

            if(!invoice.customer && !id) setInvoice({...invoice, customer: data[0].id});
        }catch(error){
            //TODO : Flash notification erreur
            history.replace('/invoices')
        }
    }

    //Récupération d'une facture
    const fetchInvoice = async id => {
        try{
            const { amount, status, customer } = await InvoicesAPI.find(id);
            setInvoice({amount, status, customer: customer.id});
        }catch (error){
            //TODO : Flash notification erreur
            history.replace('/invoices')
        }
    }

    //Récupération de la liste des clients à chaque chargement du compasant
    useEffect(() => {
        fetchCustomers();
    }, []);

    //Récupération de la bonne facture quand l'identifiant de l'URL change
    useEffect(() => {
        if(id !== "new"){
            setEditing(true);
            fetchInvoice(id);
        }
    }, [id]);

     //Gestion des changements des inputs dans le formulaire
     const handleChange = ({currentTarget}) => {
        const {name, value} = currentTarget;
        setInvoice({...invoice, [name]: value});
    }

    //Gestion de la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();

        try{
            if(editing){
                await InvoicesAPI.update(id, invoice);
                // TODO : Flash notificaion succès
            } else {
                await InvoicesAPI.create(invoice)
                // TODO : Flash notificaion succès
                history.replace("/invoices");
            }
        }catch({ response }){
            const { violations } = response.data;
            if(violations){
                const apiErrors = {};
                violations.forEach(({propertyPath, message}) => {
                    apiErrors[propertyPath] = message;
                });

                setErrors(apiErrors);
                // TODO : Flash notification d'erreur
            }
        }
    }

    return ( 
        <>
            {editing && <h1>Modification de la facture</h1> || <h1>Création d'une facture</h1>}
            <form onSubmit={handleSubmit}>
                <Field name="amount" type="number" label="Montant" placeholder="Montant de la facture" value={invoice.amount} 
                    onChange={handleChange} error={errors.amount} />
                <Select name="customer" label="Client" value={invoice.customer} error={errors.customer} onChange={handleChange}>
                    {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.firstname} {customer.lastName}</option>)}
                </Select>
                <Select name="status" label="Statut" value={invoice.status} error={errors.status} onChange={handleChange}>
                    <option value="SENT">Envoyée</option>
                    <option value="PAID">Payée</option>
                    <option value="CANCELLED">Annulée</option>
                </Select>

                <div className="form-group">
                    <button type="submit" className="btn btn-success">Enregistrer</button>
                    <Link to="/invoices" className="btn btn-link">Retour à la liste</Link>
                </div>
            </form>
        </>
     );
}
 
export default InvoicePage;