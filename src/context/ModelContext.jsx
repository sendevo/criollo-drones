import React, {createContext} from 'react';
import CriolloModel from '../entities/Model';
import { Capacitor } from '@capacitor/core';

const model = new CriolloModel();

if(Capacitor.isNativePlatform())
    window.criollomodel = model;

export const ModelCtx = createContext();

export const ModelProvider = props => (
    <ModelCtx.Provider value={model}>
        {props.children}
    </ModelCtx.Provider>
);

