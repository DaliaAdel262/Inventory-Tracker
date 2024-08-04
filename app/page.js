
'use client'

import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, addDoc } from 'firebase/firestore';
import CameraComponent from './camera'; 
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

export default function Home() {

  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const updateInventory = async function () {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(function (doc) {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  }

  const removeItem = async function (item) {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - 1 });
      }
    }
    await updateInventory();
  }

  const addItem = async function (item) {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }

    await updateInventory();
  }

  const updateItem = async function (oldName, newName, itemCount) {
    const oldDocRef = doc(collection(firestore, 'inventory'), oldName);
    const newDocRef = doc(collection(firestore, 'inventory'), newName);

    const oldDocSnap = await getDoc(oldDocRef);

    if (oldDocSnap.exists()) {
      const { count } = oldDocSnap.data();

      if (oldName !== newName) {
        await setDoc(newDocRef, { count: parseInt(itemCount, 10) });
        await deleteDoc(oldDocRef);
      } else {
        await setDoc(oldDocRef, { count: parseInt(itemCount, 10) });
      }
    }

    await updateInventory();
  }

  const handleOpen = function (item = null) {
    setEditingItem(item);
    setItemName(item ? item.name : '');
    setItemCount(item ? item.count : '');
    setOpen(true);
  }
  const handleClose = function () {
    setOpen(false);
    setItemName('');
    setItemCount('');
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const uploadPhoto = async (photo) => {
    const storage = getStorage();
    const storageRef = ref(storage, 'photos/' + Date.now());
  
    try {
      await uploadString(storageRef, photo, 'data_url');
  
      const url = await getDownloadURL(storageRef);
  
      const photosCollection = collection(firestore, 'photos');
      await addDoc(photosCollection, {
        url,
        timestamp: Date.now(),
      });
  
      console.log('Photo uploaded and URL saved in Firestore');
      return url;
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  useEffect(function () {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery)
  );

  return (
    <Box
      height="100%"
      display='flex'
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      gap={2}
    >
      <Typography variant="h1" p={5} sx={{mt:3}}>Inventory</Typography>

      {/*ADD MODAL*/}
      <Modal
        open={open && !editingItem}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
          width={500}
          bgcolor="white"
          border="1px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection='column'
          gap={3}
        >
          <Typography variant='h6'>Add Item</Typography>
          <Stack width="100%" direction="row" spacing={3}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={function (e) { setItemName(e.target.value.toLowerCase()); }}
            />
            <Button
              variant="contained"
              onClick={function () { addItem(itemName); handleClose(); }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>


      {/*UPDATE MODAL*/}
      <Modal
        open={open && editingItem}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
          width={500}
          bgcolor="white"
          border="1px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection='column'
          gap={3}
        >
          <Typography variant='h4'>Update Item</Typography>
          <Stack width="100%" direction="column" spacing={3}>
            <Box>
              <Typography variant="h6">Name</Typography>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={function (e) { setItemName(e.target.value); }}
              />
            </Box>
            <Box>
              <Typography variant="h6">Count</Typography>
              <TextField
                variant="outlined"
                fullWidth
                value={itemCount}
                onChange={function (e) { setItemCount(e.target.value); }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={function () {
                if (editingItem) {
                  updateItem(editingItem.name, itemName, itemCount);
                }
                handleClose();
              }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box width="80%" height="600px" display="flex" flexDirection="column" gap={3}>
        <Stack direction="row" spacing={3} alignItems="center" width="100%">
          <Button
            variant="contained"
            onClick={function () { setCameraOpen(!cameraOpen); }} 
          >
            {cameraOpen ? "Close Camera" : "Open Camera"}
          </Button>
          <Button
            variant="contained"
            onClick={function () { handleOpen(); }}
          >
            Add new item
          </Button>
          <TextField
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search item name"
            p={3}
            sx={{ width: '50%' }}
          />
        </Stack>
        {cameraOpen && <CameraComponent />}
        <Box width="100%" height="100px" borderRadius={3} display="flex" flexDirection='row' justifyContent="space-between" p={4} bgcolor="#0277bd">
          <Typography variant="h5" sx={{ color: "white" }}>Name</Typography>
          <Typography variant="h5" sx={{ color: "white" }}>Count</Typography>
          <Typography variant="h5" sx={{ color: "white" }}>Actions</Typography>
        </Box>
        <Box width="100%" height="auto" display="flex" flexDirection='column'>
          {
            filteredInventory.map(({ name, count }) => (
              <Box key={name} width="100%" height="100px" display="flex" flexDirection='row' justifyContent="space-between" p={5}>
                <Typography variant="h5" width="100px">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                <Typography variant="h5">{count}</Typography>
                <Box>
                  <Button
                    variant="contained"
                    sx={{ color: '#fff', mr: 2 }}
                    onClick={function () { removeItem(name); }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ color: '#fff' }}
                    onClick={function () { handleOpen({ name, count }); }}
                  >
                    Update
                  </Button>
                </Box>
              </Box>
            ))
          }
        </Box>
      </Box>
    </Box>
  );
}
