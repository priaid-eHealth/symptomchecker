<?php
/**
 * ApiMedic.com Sample Avatar, a demo implementation of the ApiMedic.com Symptom Checker by priaid Inc, Switzerland
 * 
 * Copyright (C) 2012 priaid inc, Switzerland
 * 
 * This file is part of The Sample Avatar.
 * 
 * This is free implementation: you can redistribute it and/or modify it under the terms of the
 * GNU General Public License Version 3 as published by the Free Software Foundation.
 * 
 * The ApiMedic.com Sample Avatar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * 
 * See the GNU General Public License for more details. You should have received a copy of the GNU
 * General Public License along this file. If not, see <http://www.gnu.org/licenses/>.
 * 
 * Authors: priaid inc, Switzerland
 */
 
    class TokenGenerator
    {
        private $authServiceUrl = ''; 
		private $username = '';
		private $password = '';
        
        # constructor
        function __construct($username, $pasword, $authServiceUrl) {
            $this->username = $username;
            $this->password = $pasword;
            $this->authServiceUrl = $authServiceUrl;
        }
        
		# <summary>
        # loadToken function. Gets a token from $authServiceUrl.
        # </summary>
        # <param name="$username">api user username</param>
        # <param name="$password">api user password</param>
        # <param name="$authServiceUrl">priaid login url (https://authservice.priaid.ch/login)</param>
        # <returns>Returns deserialized token object. It has 2 properties: 'Token' and 'ValidThrough'</returns>
		public function loadToken()
		{
			$computedHash = base64_encode(hash_hmac ( 'md5' , $this->authServiceUrl , $this->password, true ));
			$authorization = 'Authorization: Bearer '.$this->username.':'.$computedHash;
			
			$curl = curl_init();
			curl_setopt($curl, CURLOPT_POST, true);
			curl_setopt($curl, CURLOPT_POSTFIELDS, '');
			curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json' , $authorization ));
			curl_setopt($curl, CURLOPT_URL, $this->authServiceUrl);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

			$result = curl_exec($curl);
            $obj = json_decode($result);
            $info = curl_getinfo($curl);
            curl_close($curl);
            
            if($info['http_code'] != '200')
            {
                // print error from the server
                echo($obj);
                return NULL;
            }
            
            return $obj;
		}
    }
?>